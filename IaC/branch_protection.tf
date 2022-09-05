resource "github_branch_protection" "main_branch" {
  repository_id = "dapr-demo"

  pattern          = "main"
  enforce_admins   = true
  allows_deletions = false
  required_pull_request_reviews {}
}