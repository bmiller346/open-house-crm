import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import Link from 'next/link';

export function Appbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link href="/" passHref>
            OpenHouse CRM
          </Link>
        </Typography>
        <Link href="/resources" passHref><Button color="inherit">Resources</Button></Link>
        <Link href="/login" passHref><Button color="inherit">Login</Button></Link>
      </Toolbar>
    </AppBar>
  );
}
