import React from "react";

interface DateComponentProps {
  date: string;
}

const DateFormate: React.FC<DateComponentProps> = ({ date }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return <span>{formatDate(date)}</span>;
};

export default DateFormate;
