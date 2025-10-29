import { toast } from "sonner";
import { AxiosError } from "axios";

export const handleToastError = (error: Error) => {
  if (error instanceof AxiosError) {
    const errorMessage =
      error.response?.data?.error || "An unexpected error occurred.";
    toast.error(errorMessage);
    console.error(errorMessage);
  } else {
    toast.error("An unexpected error occurred.");
    console.error(error.message);
  }
};
