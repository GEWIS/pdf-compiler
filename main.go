package main

import (
	"bytes"
	"encoding/json"
	docs "github.com/gewis/pdf-compiler/docs"
	"github.com/go-chi/chi/v5"
	"github.com/rs/zerolog/log"
	httpSwagger "github.com/swaggo/http-swagger/v2"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

var (
	basePath    = String("BASE_PATH", "/api/v1")
	port        = String("PORT", ":8080")
	templateDir = String("TEMPLATE_DIR", "templates")
)

// @title PDF Compiler
// @version 1.0
// @description A simple API to compile LaTeX templates to PDF
// @servers.url http://localhost:8080/api/v1
func main() {
	r := chi.NewRouter()

	r.Route(basePath, func(r chi.Router) {
		r.Post("/compile", Compile)
		r.Get("/health", HealthCheck)
	})

	r.Get("/swagger/*", httpSwagger.WrapHandler)
	r.Get("/swagger/doc.json", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(200)
		w.Write([]byte(docs.SwaggerInfo.ReadDoc()))
	})

	log.Info().Msgf("Starting pdf-compiler server %s on port %s", basePath, port)
	log.Fatal().Err(http.ListenAndServe(port, r)).Msg("Server stopped")
}

// HealthCheck returns 200 OK
//
// @Summary Health check
// @Description Returns 200 OK
// @Tags Health
// @Success 200
// @Router /health [get]
func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}

type CompileRequest struct {
	Tex string `json:"tex" example:"\\documentclass{article}\n\\begin{document}\nHello, world!\n\\end{document}"`
}

type ErrorResponse struct {
	Error string `json:"error" example:"Invalid request, must provide LaTeX template"`
}

// Compile compiles a LaTeX template to PDF
//
// @Summary Compile LaTeX template
// @Description Compiles a LaTeX template and returns a PDF
// @Tags Compile
// @Accept json
// @Produce application/pdf
// @Param request body CompileRequest true "LaTeX template"
// @Success 200 {string} file "PDF file"
// @Failure 400 {object} main.ErrorResponse "Invalid request"
// @Failure 500 {object} main.ErrorResponse "Compilation error"
// @Router /compile [post]
func Compile(w http.ResponseWriter, r *http.Request) {
	var req CompileRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Tex == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid request, must provide LaTeX template"})
		return
	}
	defer r.Body.Close()

	// Write LaTeX to a temp file
	dir, err := os.MkdirTemp("", "latex")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to create temp directory"})
		return
	}
	defer os.RemoveAll(dir) // Clean up temp files

	texPath := filepath.Join(dir, "input.tex")
	if err := os.WriteFile(texPath, []byte(req.Tex), 0644); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "Failed to write template file"})
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
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: errorMsg})
		return
	}

	pdfPath := filepath.Join(dir, "input.pdf")
	pdfFile, err := os.Open(pdfPath)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(ErrorResponse{Error: "PDF not generated"})
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
