//* Dependencies
import React, { useContext } from "react";

//* Material-UI components, hooks, and icons
import { Container, Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";

//* State context
import AlertContext from "../../context/alert/alertContext";

//* Exported component
const Alerts = () => {
  //* Initializes the alert state context
  const alertContext = useContext(AlertContext);

  //* Returns JSX to DOM
  return (
    alertContext && 
    alertContext.alerts.length > 0 &&
    alertContext.alerts.map((alert) => (
      <div key={alert.id} className={`alert alert-${alert.type}`}>
        <Container>
          <Typography variant="body1" align="center">
            <ErrorIcon />
            <div>{alert.msg}</div>
          </Typography>
        </Container>
      </div>
    ))
  );
};

export default Alerts;
