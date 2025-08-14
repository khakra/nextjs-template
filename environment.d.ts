declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_PROJECT_NAME: string
      NEXT_PUBLIC_PROJECT_BASE_URL: string
      NEXT_PUBLIC_META_DESCRIPTION: string
      NEXT_PUBLIC_GOOGLE_ANALYTICS: string

      DATABASE_URL: string

      BETTER_AUTH_SECRET: string
      BETTER_AUTH_URL: string

      EMAIL_FROM: string
      AWS_SES_ACCESS_KEY: string
      AWS_SES_SECRET_KEY: string
      AWS_SES_REGION: string

      AWS_S3_ACCESS_KEY: string
      AWS_S3_SECRET_KEY: string
      AWS_S3_BUCKET_NAME: string
      AWS_S3_REGION: string
      NEXT_PUBLIC_AWS_S3_BUCKET_URL: string

      STRIPE_SECRET_KEY: string
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
      STRIPE_WEBHOOK_SECRET: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
