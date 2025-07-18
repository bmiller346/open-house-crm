//* Dependencies
import React from "react";
import styles from "./layout.module.css";

//* Material UI components, hooks, and icons
import { Fab, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const style = {
  margin: 0,
  top: "auto",
  right: 60,
  bottom: 20,
  left: "auto",
  position: "fixed" as const,
  backgroundColor: "#008B8B",
  color: "white",
  border: "3px solid darkslategrey ",
  width: "4rem",
  height: "4rem",
};

interface FloatingActionProps {
  handleClickOpen: () => void;
  toolType: string;
}

//* Exported component
export default function FloatingAction({ handleClickOpen, toolType }: FloatingActionProps) {
  const generateToolTip = (toolType: string) => {
    switch (toolType) {
      case "transactions":
        return "Add Transaction";
      case "contacts":
        return "Add Contact";
      case "inventory":
        return "Add Inventory Item";
      default:
        return;
    }
  };

  //* Returns JSX to DOM
  return (
    <div className={styles.root}>
      <Tooltip title={generateToolTip(toolType)} placement="left">
        <Fab aria-label="add" style={style} onClick={handleClickOpen}>
          <AddIcon />
        </Fab>
      </Tooltip>
    </div>
  );
}
