import React from "react";
import { Grid, Paper, Typography, Box, Chip } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import ShieldIcon from "@mui/icons-material/Shield";
import MessageIcon from "@mui/icons-material/Message";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const StatCard = ({ title, value, icon, subtitle }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary">{title}</Typography>
          <Typography variant="h5" fontWeight="bold">
            {value}
          </Typography>
          <Typography variant="body2">{subtitle}</Typography>
        </Box>
        {icon}
      </Box>
    </Paper>
  );
};

const DashboardHome = () => {
  return (
    <Box>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Cyberbullying Detection Dashboard
      </Typography>

      <Typography color="textSecondary" mb={3}>
        Real-time NLP-powered message analysis
      </Typography>

      {/* Stats */}
      <Grid container spacing={3} mb={4}>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Analyzed"
            value="12,847"
            subtitle="Messages scanned today"
            icon={<MessageIcon color="primary" />}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Flagged"
            value="342"
            subtitle="2.7% of total"
            icon={<WarningIcon color="error" />}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Safe"
            value="11,614"
            subtitle="Clean messages"
            icon={<ShieldIcon color="success" />}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Avg Response"
            value="1.2s"
            subtitle="Detection latency"
            icon={<AccessTimeIcon color="primary" />}
          />
        </Grid>

      </Grid>

      {/* Live Feed */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>
          Live Message Feed
        </Typography>

        {/* Flagged message */}
        <Paper sx={{ p: 2, mb: 2, background: "#fff3f3" }}>
          <Box display="flex" justifyContent="space-between">
            <Typography fontWeight="bold">Anonymous_User42</Typography>
            <Chip label="Flagged" color="error" size="small" />
          </Box>

          <Typography mt={1}>
            You're so <b style={{color:"red"}}>ugly</b> nobody wants to be your friend. Just <b style={{color:"red"}}>disappear</b> already.
          </Typography>

          <Typography variant="body2" color="textSecondary">
            Confidence: 94% • 2 harmful terms detected
          </Typography>
        </Paper>

        {/* Safe message */}
        <Paper sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between">
            <Typography fontWeight="bold">CoolKid99</Typography>
            <Chip label="Safe" color="success" size="small" />
          </Box>

          <Typography mt={1}>
            Hey everyone! Check out this cool art project I just finished 🎨
          </Typography>

        </Paper>

      </Paper>

    </Box>
  );
};

export default DashboardHome;