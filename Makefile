.PHONY: setup backend frontend test test-backend test-frontend install-hooks

VENV = backend/.venv

setup: $(VENV)
	$(VENV)/bin/pip install -q -r backend/requirements.txt pytest

$(VENV):
	python3 -m venv $(VENV)

backend: setup
	cd backend && .venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

frontend:
	cd frontend && npm install && npm start

test-backend: setup
	cd backend && POSTGRES_DB=applyquest_test .venv/bin/pytest tests/ -v

test-frontend:
	cd frontend && npm test -- --watchAll=false --passWithNoTests

test: test-backend test-frontend

install-hooks:
	cp scripts/pre-commit.sh .git/hooks/pre-commit
	chmod +x .git/hooks/pre-commit
	@echo "Pre-commit hook installed."
