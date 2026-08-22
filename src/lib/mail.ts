import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const sesClient = new SESv2Client({
  region: process.env.AWS_SES_REGION || "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_SES_SECRET_KEY || "",
  },
});

export async function sendEmail(
  subject: string,
  htmlBody: string,
  textBody: string,
  recipient: string | string[],
  from?: string
) {
  const params = {
    FromEmailAddress: from ?? process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: Array.isArray(recipient) ? recipient : [recipient],
    },
    Content: {
      Simple: {
        Subject: {
          Data: subject,
        },
        Body: {
          Text: {
            Data: textBody,
          },
          Html: {
            Data: htmlBody,
          },
        },
      },
    },
  };

  try {
    if (process.env.NODE_ENV === "production") {
      const res = await sesClient.send(new SendEmailCommand(params));
      return res;
    }
    console.log(params.Content.Simple.Body.Text.Data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode =
      error && typeof error === "object" && "Code" in error
        ? String(error.Code)
        : undefined;

    console.error("Email sending failed:", {
      error: errorMessage,
      code: errorCode,
      details: String(error),
      params: {
        to: params.Destination.ToAddresses,
        from: params.FromEmailAddress,
        subject: params.Content.Simple.Subject.Data,
      },
    });

    throw new Error(`Failed to send email: ${errorMessage}`, { cause: error });
  }
}
