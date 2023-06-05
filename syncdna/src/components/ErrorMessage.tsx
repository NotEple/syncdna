import { useNavigate } from "react-router-dom";

interface ErrorMessageType {
  message: string;
  status?: number;
  redirect?: boolean;
}

// Simple error function that returns a div with a error status, message and can redirect the user back to the home page.
export default function ErrorMessage({
  message,
  status,
  redirect,
}: ErrorMessageType) {
  const navigate = useNavigate();

  if (redirect === true) {
    setTimeout(() => {
      navigate("/");
    }, 5000);
  }

  return (
    <div className="error-message">
      {redirect} {status} {message}
    </div>
  );
}
