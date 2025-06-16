APP_NAME := pdf-compiler
TEMPLATES_REPO := git@github.com:GEWIS/latex-templates.git
TEMPLATES_DIR := templates

.PHONY: all build swag templates_sync clean

all: templates_sync swag build

templates_sync:
	@if [ -d "$(TEMPLATES_DIR)" ]; then \
		echo "Removing existing templates directory..."; \
		rm -rf $(TEMPLATES_DIR); \
	fi
	echo "Cloning LaTeX templates from private repo..."
	git clone --depth=1 $(TEMPLATES_REPO) $(TEMPLATES_DIR)

swag:
	swag init -g main.go

build:
	go build -o $(APP_NAME) .

clean:
	rm -f $(APP_NAME)
	rm -rf $(TEMPLATES_DIR)