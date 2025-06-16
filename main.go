package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/rs/zerolog/log"
	httpSwagger "github.com/swaggo/http-swagger/v2"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	docs "pdf-compiler/docs"
	"strings"
)

var (
	basePath    = String("BASE_PATH", "/api/v1")
	port        = String("PORT", ":80")
	host        = String("HOST", "127.0.0.1")
	templateDir = String("TEMPLATE_DIR", "templates/BAC")
)

// @title PDF Compiler
// @version 1.0
// @description A simple API to compile LaTeX templates to
// @basePath /
func main() {
	r := chi.NewRouter()

	docs.SwaggerInfo.Host = fmt.Sprintf("%s%s", host, port)
	docs.SwaggerInfo.BasePath = basePath

	r.Route(basePath, func(r chi.Router) {
		r.Post("/compile", Compile)
	})

	r.Mount("/swagger", httpSwagger.WrapHandler)

	log.Info().Msgf("Starting pdf-compiler server %s on port %s", basePath, port)
	http.ListenAndServe(port, r)
}

type CompileRequest struct {
	Tex string `json:"tex"`
}

// Compile compiles a LaTeX template to PDF
//
// @Summary Compile LaTeX template
// @Description Compiles a LaTeX template and returns a PDF
// @Tags Compile
// @Accept json
// @Produce application/pdf
// @Param request body CompileRequest true "LaTeX template"
// @Success 200 {file} file "PDF file"
// @Failure 400 {object} map[string]string "Invalid request"
// @Failure 500 {object} map[string]string "Compilation error"
// @Router /compile [post]
func Compile(w http.ResponseWriter, r *http.Request) {
	var req CompileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Tex == "" {
		http.Error(w, `{"error":"Invalid request, must provide LaTeX template"}`, http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Write LaTeX to a temp file
	dir, err := os.MkdirTemp("", "latex")
	if err != nil {
		http.Error(w, `{"error":"Failed to create temp directory"}`, http.StatusInternalServerError)
		return
	}
	defer os.RemoveAll(dir) // Clean up temp files

	texPath := filepath.Join(dir, "input.tex")
	if err := os.WriteFile(texPath, []byte(req.Tex), 0644); err != nil {
		http.Error(w, `{"error":"Failed to write template file"}`, http.StatusInternalServerError)
		return
	}

	// Compile LaTeX to PDF using pdflatex (ensure installed!)
	cmd := exec.Command("pdflatex", "-output-directory", dir, "-interaction=nonstopmode", texPath)
	env := os.Environ()
	env = append(env, "TEXINPUTS="+templateDir+string(os.PathListSeparator))
	cmd.Env = env

	var compileLog bytes.Buffer
	cmd.Stdout = &compileLog
	cmd.Stderr = &compileLog
	if err := cmd.Run(); err != nil {
		log.Error().Err(err).Str("log", compileLog.String()).Msg("pdflatex error")
		errorMsg := extractLatexError(compileLog.String())
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, errorMsg), http.StatusInternalServerError)
		return
	}

	pdfPath := filepath.Join(dir, "input.pdf")
	pdfFile, err := os.Open(pdfPath)
	if err != nil {
		http.Error(w, `{"error":"PDF not generated"}`, http.StatusInternalServerError)
		return
	}
	defer pdfFile.Close()

	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", "attachment; filename=output.pdf")
	io.Copy(w, pdfFile)
}

func extractLatexError(log string) string {
	for _, line := range strings.Split(log, "\n") {
		if strings.HasPrefix(line, "! ") {
			return line
		}
	}
	// fallback...
	return "Unknown LaTeX error"
}
