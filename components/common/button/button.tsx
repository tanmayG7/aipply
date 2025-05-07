import React from "react";

interface ButtonProps {
  text: string;
}

const Button: React.FC<ButtonProps> = ({ text }) => {
  return (
    <div>
      <button className="font-manrope font-bold uppercase text-[14px] leading-[20px] border-[#5D29FF] text-transparent bg-clip-text bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] border rounded-full px-5 py-3">
        {text}
      </button>
    </div>
  );
};

export default Button;
