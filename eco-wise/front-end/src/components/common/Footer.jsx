import React from 'react';
import { AppBar, Toolbar, Typography, Link, IconButton, Grid, CssBaseline } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';

function Footer() {
  return (

    <AppBar position="static" component="footer" sx={{ backgroundColor: "primaryColor", py: 1}}>
      <CssBaseline />
      <Toolbar sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
        <Grid container spacing={2} sx={{ justifyContent: 'space-between', width: '100%' }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1" align="center" fontFamily="Poppins" sx={{ mt: 1 }}>
              © {new Date().getFullYear()} EcoWise
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Link href="/privacy" color="inherit" underline="hover" fontFamily="Poppins" sx={{ mx: 1, mt: 1 }}>
              Privacy Policy
            </Link>
            <Link href="/terms" color="inherit" underline="hover" fontFamily="Poppins" sx={{ mx: 1, mt: 1 }}>
              Terms of Service
            </Link>
            <Link href="/contact" color="inherit" underline="hover" fontFamily="Poppins" sx={{ mx: 1, mt: 1 }}>
              Contact Us
            </Link>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton color="inherit" href="https://www.instagram.com" target="_blank" aria-label="Instagram">
              <InstagramIcon />
            </IconButton>
            <IconButton color="inherit" href="https://www.facebook.com" target="_blank" aria-label="Facebook">
              <FacebookIcon />
            </IconButton>
            <IconButton color="inherit" href="https://www.twitter.com" target="_blank" aria-label="Twitter">
              <TwitterIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}

export default Footer;