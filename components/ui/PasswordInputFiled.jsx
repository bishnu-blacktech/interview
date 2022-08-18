import React from "react";
import cn from "classnames";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const PasswordInputField = React.forwardRef((props, ref) => {
  const { className, ...others } = props;

  const [displayPassword, setDisplayPassword] = useState(false);
  return (
    <div className="w-100 position-relative">
      <input
        type={displayPassword ? "text" : "password"}
        className={cn("w-100", className)}
        style={{ paddingRight: "37px!important" }}
        ref={ref}
        {...others}
      />
      <div className="position-absolute" style={{ right: "10px", top: "10px" }}>
        {displayPassword ? (
          <AiOutlineEyeInvisible
            size={20}
            onClick={() => setDisplayPassword(false)}
          />
        ) : (
          <AiOutlineEye size={20} onClick={() => setDisplayPassword(true)} />
        )}
      </div>
    </div>
  );
});

export default PasswordInputField;
