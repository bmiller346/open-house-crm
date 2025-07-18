import React, { useContext, useEffect } from "react";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import AuthContext from "../../context/auth/authContext";
import NavPanel from "../layout/NavPanel";
import ResourceCenter from "../resources/ResourceCenter";

const ResourcesPage = () => {
  const authContext = useContext(AuthContext);

  useEffect(() => {
    authContext.loadUser();
    // eslint-disable-next-line
  }, []);

  return (
    <Container>
      <Grid container spacing={3} alignItems="center" justify="center">
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          style={{ marginTop: "5rem" }}
        >
          <NavPanel />
          <ResourceCenter />
        </Grid>
      </Grid>
    </Container>
  );
};

export default ResourcesPage;
