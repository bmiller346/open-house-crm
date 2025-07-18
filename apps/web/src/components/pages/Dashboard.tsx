import React, { useContext, useEffect } from "react";
import { Container, Grid } from "@mui/material";
import Contacts from "../contacts/Contacts";
import ContactFilter from "../contacts/ContactFilter";
import NavPanel from "../layout/NavPanel";
import AuthContext from "../../context/auth/authContext";

interface AuthContextType {
  loadUser: () => void;
}

const Dashboard: React.FC = () => {
  const authContext = useContext(AuthContext) as AuthContextType;

  useEffect(() => {
    authContext.loadUser();
  }, []);

  return (
    <Container>
      <Grid container spacing={3} alignItems="center" justifyContent="center">
        <Grid
          item
          xs={12}
          sm={12}
          md={8}
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '5rem'
          }}
        >
          <NavPanel />
          <ContactFilter />
          <Contacts />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
