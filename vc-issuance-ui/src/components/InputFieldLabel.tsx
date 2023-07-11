import React from "react";

type InputFieldLabelProps = {
  show: boolean;
  label: string;
};

const InputFieldLabel = (props: InputFieldLabelProps) => (
  <>
    {props.show && (
      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        {props.label}
      </label>
    )}
  </>
);

export default InputFieldLabel;
