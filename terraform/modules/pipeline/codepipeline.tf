


data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["codepipeline.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "sfc_codepipeline_permission_sets_role" {
  name = "SFCCodePipelineRole"

 assume_role_policy = data.aws_iam_policy_document.assume_role.json
}


resource "aws_codepipeline" "sfc_codepipeline" {
  name     = "sfc-pipeline"
  role_arn = aws_iam_role.sfc_codepipeline_permission_sets_role.arn

  artifact_store {
    location = aws_s3_bucket.codepipeline_bucket.bucket
    type     = "S3"

    # encryption_key {
    #   id   = data.aws_kms_alias.s3kmskey.arn
    #   type = "KMS"
    # }
  }



  stage {
    name = "Source"

    action {
      name             = "Source"
      category         = "Source"
      owner            = "ThirdParty"
      provider         = "GitHub"
      version          = "1"
      output_artifacts = ["test"]

      configuration = {
        OAuthToken = ""
        Owner  = "SFC"
        Repo   = "test"
        Branch = "test"
      }
    }
  }

  stage {
    name = "Build"

    action {
      name            = "Build"
      category        = "Build"
      owner           = "AWS"
      provider        = "CodeBuild"
      input_artifacts = ["test"]
      version         = "1"

      configuration = {
        ProjectName = "test"


      }
    }
  }
}
  resource "aws_s3_bucket" "codepipeline_bucket" {
  bucket = "sfc-test-bucket-codepipeline"
}

# A shared secret between GitHub and AWS that allows AWS
# CodePipeline to authenticate the request came from GitHub.
# Would probably be better to pull this from the environment
# or something like SSM Parameter Store.
# locals {
#   webhook_secret = "super-secret"
# }

# resource "aws_codepipeline_webhook" "bar" {
#   name            = "test-webhook-github-bar"
#   authentication  = "GITHUB_HMAC"
#   target_action   = "Source"
#   target_pipeline = aws_codepipeline.bar.name

#   authentication_configuration {
#     secret_token = local.webhook_secret
#   }

#   filter {
#     json_path    = "$.ref"
#     match_equals = "refs/heads/{Branch}"
#   }
# }

# Wire the CodePipeline webhook into a GitHub repository.
# resource "github_repository_webhook" "bar" {
#   repository = github_repository.repo.name

#   name = "web"

#   configuration {
#     url          = aws_codepipeline_webhook.bar.url
#     content_type = "json"
#     insecure_ssl = true
#     secret       = local.webhook_secret
#   }

#   events = ["push"]
# }
