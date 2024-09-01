import { FC, memo, useState } from "react";

export const CustomEl: FC = memo(() => {
  console.log("test123");
  const [val, setVal] = useState(1);
  return (
    <div
      style={{
        position: "absolute",
        width: "10px",
        height: "10px",
        left: "10px",
        top: "100px",
        background: "green",
      }}
      onClick={() => setVal(val + 1)}
    >
      {val}
    </div>
  );
});
