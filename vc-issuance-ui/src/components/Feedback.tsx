import React from "react";

type FeedbackProps = {
  display: boolean;
  message: string;
  textColor: string;
};

const Feedback = (props: FeedbackProps) => (
  <span
    className={`mt-2 ${props.display ? "block" : "hidden"} ${props.textColor}`}
  >
    {props.message}
  </span>
);

export default Feedback;
