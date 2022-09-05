terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 4.31.0"
    }
  }
}

provider "github" {
  token = var.token
}