"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import BlockIcon from "@mui/icons-material/Block";
import { Upload } from "lucide-react";

type CampaignStatus = "Active" | "Inactive";

interface Campaign {
  id: number;
  name: string;
  purpose: string;
  fileName: string;
  status: CampaignStatus;
  createdAt: string;
}

const initialCampaigns: Campaign[] = [
  
];

const CampaignPage: React.FC = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [campaigns, setCampaigns] =
    React.useState<Campaign[]>(initialCampaigns);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "All" | CampaignStatus
  >("All");

  const [addOpen, setAddOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [integrationsOpen, setIntegrationsOpen] = React.useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    React.useState<Campaign | null>(null);

  // form state
  const [newName, setNewName] = React.useState("");
  const [newPurpose, setNewPurpose] = React.useState("");
  const [newFile, setNewFile] = React.useState<File | null>(null);
  const [scriptFile, setScriptFile] = React.useState<File | null>(null);

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.purpose.toLowerCase().includes(search.toLowerCase()) ||
      c.fileName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ? true : c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFile(file);
  };

  const handleScriptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScriptFile(file);
  };

  const handleSubmitNewCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPurpose.trim() || !newFile) return;

    const next: Campaign = {
      id: Date.now(),
      name: newName.trim(),
      purpose: newPurpose.trim(),
      fileName: newFile.name,
      status: "Active",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setCampaigns((prev) => [next, ...prev]);
    // reset form
    setNewName("");
    setNewPurpose("");
    setNewFile(null);
    setScriptFile(null);
    setAddOpen(false);
  };

  const handleOpenView = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setViewOpen(true);
  };

  const handleDelete = (campaign: Campaign) => {
    // no-op for now, but keep UI behaviour
    console.log("Delete clicked for", campaign.name);
  };

  const handleDeactivate = (campaign: Campaign) => {
    setCampaigns((prev) =>
      prev.map((item) =>
        item.id === campaign.id ? { ...item, status: "Inactive" } : item
      )
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor:
          "linear-gradient(135deg, #f4f5fb 0%, #ffffff 40%, #e6f0ff 100%)",
        py: { xs: 4, md: 6 },
        px: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: "1360px",
          mx: "auto",
        }}
      >
        {/* Page header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: "text.primary",
              }}
            >
              Campaigns
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.5, ml: 0.3, color: "text.secondary", maxWidth: 460 }}
            >
              Create calling campaigns, attach lead lists, and keep track of
              everything in one place.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 500,
              px: 3,
              py: 1.2,
              boxShadow:
                "0 10px 30px rgba(15,23,42,0.15), 0 0 0 1px rgba(15,23,42,0.02)",
              bgcolor: "#06b6d4", // custom cyan
              "&:hover": {
                bgcolor: "#0ea5e9", // darker cyan on hover
              },
            }}
          >
            Add campaign
          </Button>
        </Box>

        {/* Card container */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 2.5, md: 3 },
            border: "1px solid rgba(148, 163, 184, 0.3)",
            boxShadow:
              "0 24px 60px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(15, 23, 42, 0.02)",
            bgcolor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Controls */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
            sx={{ mb: 3 }}
          >
            <TextField
              size="small"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                minWidth: { xs: "100%", md: 260 },
              }}
            />

            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  label="Status"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as "All" | CampaignStatus)
                  }
                >
                  <MenuItem value="All">All statuses</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          {/* Table wrapper with horizontal scroll on small screens */}
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <TableContainer component={Box}>
              <Table
                size="small"
                sx={{
                  minWidth: 720,
                  "& th": {
                    whiteSpace: "nowrap",
                    bgcolor: "rgba(248,250,252,0.8)",
                    borderBottomColor: "rgba(226,232,240,0.8)",
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                    color: "text.secondary",
                  },
                  "& td": {
                    borderBottomColor: "rgba(226,232,240,0.7)",
                    fontSize: 13.5,
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Purpose</TableCell>
                    <TableCell>File</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCampaigns.map((campaign) => (
                    <TableRow
                      key={campaign.id}
                      hover
                      sx={{
                        "&:last-of-type td": { borderBottom: "none" },
                      }}
                    >
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500 }}
                          noWrap
                        >
                          {campaign.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                          noWrap
                        >
                          {campaign.purpose}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                          noWrap
                        >
                          {campaign.fileName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={campaign.status}
                          size="small"
                          sx={{
                            fontSize: 11,
                            fontWeight: 500,
                            px: 1,
                            borderRadius: 999,
                            bgcolor:
                              campaign.status === "Active"
                                ? "rgba(34,197,94,0.08)"
                                : "rgba(148,163,184,0.16)",
                            color:
                              campaign.status === "Active"
                                ? "#15803d"
                                : "#475569",
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                          noWrap
                        >
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenView(campaign)}
                          sx={{ mr: 1 }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleDeactivate(campaign)}
                          disabled={campaign.status === "Inactive"}
                          sx={{ mr: 1 }}
                        >
                          <BlockIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(campaign)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredCampaigns.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", mb: 0.5 }}
                        >
                          No campaigns match your filters.
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Try adjusting the search or status filter.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      </Box>

      {/* Add Campaign Modal */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        fullScreen={fullScreen}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: fullScreen ? 0 : 3,
            p: { xs: 1.5, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Create new campaign
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Define the basics and upload your lead list. You can wire automation
            later.
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Box component="form" onSubmit={handleSubmitNewCampaign} noValidate>
            <Stack spacing={2.5}>
              <TextField
                label="Campaign name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                fullWidth
                required
              />

              <TextField
                label="Purpose"
                value={newPurpose}
                onChange={(e) => setNewPurpose(e.target.value)}
                fullWidth
                multiline
                minRows={3}
                required
              />

              <Box>
                <Typography
                  variant="caption"
                  sx={{ mb: 0.5, display: "block", color: "text.secondary" }}
                >
                  Lead list file
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    borderStyle: "dashed",
                    borderRadius: 2,
                    textTransform: "none",
                    justifyContent: "flex-start",
                    px: 2,
                    py: 1.2,
                    width: "100%",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{ width: "100%" }}
                  >
                    <UploadIcon />
                    <Box sx={{ flex: 1, textAlign: "left" }}>
                      <Typography variant="body2">
                        {newFile ? newFile.name : "Upload PDF, XLSX, or CSV"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        Max 10MB • .pdf .xlsx .csv
                      </Typography>
                    </Box>
                  </Stack>
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.xlsx,.xls,.csv"
                    onChange={handleFileChange}
                  />
                </Button>
              </Box>
              
              <Box>
                <Typography
                  variant="caption"
                  sx={{ mb: 0.5, display: "block", color: "text.secondary" }}
                >
                  Call script (optional)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    borderStyle: "dashed",
                    borderRadius: 2,
                    textTransform: "none",
                    justifyContent: "flex-start",
                    px: 2,
                    py: 1.2,
                    width: "100%",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{ width: "100%" }}
                  >
                    <UploadIcon />
                    <Box sx={{ flex: 1, textAlign: "left" }}>
                      <Typography variant="body2">
                        {scriptFile ? scriptFile.name : "Upload optional call script"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        Accepts .pdf, .doc, .docx
                      </Typography>
                    </Box>
                  </Stack>
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx"
                    onChange={handleScriptChange}
                  />
                </Button>
              </Box>
            </Stack>

            <DialogActions sx={{ mt: 3, px: 0 }}>
              <Button
                onClick={() => setAddOpen(false)}
                color="inherit"
                sx={{ textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setIntegrationsOpen(true)}
                variant="outlined"
                startIcon={<IntegrationInstructionsIcon />}
                sx={{ textTransform: "none", borderRadius: 999 }}
              >
                Integrations
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!newName || !newPurpose || !newFile}
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  px: 3,
                  bgcolor: "#06b6d4", // custom cyan
                  "&:hover": {
                    bgcolor: "#0ea5e9", // darker cyan on hover
                  },
                }}
              >
                Submit
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* View Campaign Modal */}
      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        fullScreen={fullScreen}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: fullScreen ? 0 : 3,
            p: { xs: 1.5, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
            Campaign details
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          {selectedCampaign && (
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{ fontSize: 11, color: "text.secondary" }}
                >
                  Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedCampaign.name}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="overline"
                  sx={{ fontSize: 11, color: "text.secondary" }}
                >
                  Purpose
                </Typography>
                <Typography variant="body2">
                  {selectedCampaign.purpose}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="overline"
                  sx={{ fontSize: 11, color: "text.secondary" }}
                >
                  Lead list
                </Typography>
                <Typography variant="body2">
                  {selectedCampaign.fileName}
                </Typography>
              </Box>

              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ fontSize: 11, color: "text.secondary" }}
                  >
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedCampaign.status}
                      size="small"
                      sx={{
                        fontSize: 11,
                        borderRadius: 999,
                        bgcolor:
                          selectedCampaign.status === "Active"
                            ? "rgba(34,197,94,0.08)"
                            : "rgba(148,163,184,0.16)",
                        color:
                          selectedCampaign.status === "Active"
                            ? "#15803d"
                            : "#475569",
                      }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography
                    variant="overline"
                    sx={{ fontSize: 11, color: "text.secondary" }}
                  >
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {new Date(selectedCampaign.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setViewOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Integrations helper modal */}
      <Dialog
        open={integrationsOpen}
        onClose={() => setIntegrationsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: { xs: 1.5, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IntegrationInstructionsIcon color="primary" />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Connect integrations
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ mt: 0.5 }} color="text.secondary">
            Sync campaign outcomes to your CRM, Slack, calendar, or webhook
            endpoints. Wire these now or right after creating the campaign.
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={1.5}>
            {[
              { name: "Salesforce", detail: "Push notes & call outcomes" },
              { name: "HubSpot", detail: "Update contacts and deals" },
              { name: "Slack", detail: "Send call summaries to channels" },
              {
                name: "Google Calendar",
                detail: "Auto-book follow-ups directly on rep calendars",
              },
              {
                name: "Calendly",
                detail: "Drop booking links or schedule meetings post-call",
              },
              { name: "Webhook", detail: "POST JSON payloads to your URL" },
            ].map((integration) => (
              <Box
                key={integration.name}
                sx={{
                  border: "1px solid rgba(148, 163, 184, 0.4)",
                  borderRadius: 2,
                  p: 1.25,
                  bgcolor: "rgba(248,250,252,0.8)",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {integration.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {integration.detail}
                </Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2 }}>
          <Button
            onClick={() => setIntegrationsOpen(false)}
            sx={{ textTransform: "none" }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 3,
              bgcolor: "#06b6d4",
              "&:hover": { bgcolor: "#0ea5e9" },
            }}
            onClick={() => setIntegrationsOpen(false)}
          >
            Save & continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// simple inline upload icon using MUI's Upload if you don't want another import
const UploadIcon: React.FC = () => (
  <Box
    sx={{
      width: 32,
      height: 32,
      borderRadius: "999px",
      bgcolor: "rgba(15,23,42,0.04)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      mr: 1,
      flexShrink: 0,
    }}
  >
    <Upload fontSize="small" />
  </Box>
);

export default CampaignPage;
