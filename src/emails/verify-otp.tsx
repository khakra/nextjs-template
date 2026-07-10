import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface VerifyOtpProps {
  validationCode?: string;
}

const VerifyOtp = ({ validationCode }: VerifyOtpProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Confirm your email address</Preview>
      <Container style={container}>
        <Section style={logoContainer}>
          <Text style={wordmark}>{process.env.NEXT_PUBLIC_PROJECT_NAME}</Text>
        </Section>
        <Heading style={h1}>Confirm your email address</Heading>
        <Text style={heroText}>
          Your login verification code is below - enter it in your open browser
          window and we&apos;ll help you get signed in.
        </Text>

        <Section style={codeBox}>
          <Text style={confirmationCodeText}>{validationCode}</Text>
        </Section>

        <Text style={text}>
          If you didn&apos;t request this email, there&apos;s nothing to worry
          about, you can safely ignore it.
        </Text>

        <Section style={footer}>
          <Text style={footerText}>{process.env.NEXT_PUBLIC_PROJECT_NAME}</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

VerifyOtp.PreviewProps = {
  validationCode: "123456",
} as VerifyOtpProps;

const wordmark = {
  color: "#1d1c1d",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0",
};

const footer = {
  marginBottom: "32px",
};

const footerText = {
  fontSize: "12px",
  color: "#b7b7b7",
  lineHeight: "15px",
  textAlign: "left" as const,
};

const main = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "0px 20px",
};

const logoContainer = {
  marginTop: "32px",
};

const h1 = {
  color: "#1d1c1d",
  fontSize: "36px",
  fontWeight: "700",
  margin: "30px 0",
  padding: "0",
  lineHeight: "42px",
};

const heroText = {
  fontSize: "20px",
  lineHeight: "28px",
  marginBottom: "30px",
};

const codeBox = {
  background: "rgb(245, 244, 245)",
  borderRadius: "4px",
  marginBottom: "30px",
  padding: "40px 10px",
};

const confirmationCodeText = {
  fontSize: "30px",
  textAlign: "center" as const,
  verticalAlign: "middle",
};

const text = {
  color: "#000",
  fontSize: "14px",
  lineHeight: "24px",
};

export default VerifyOtp;
