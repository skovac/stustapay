import * as React from "react";
import { useDeleteTerminalLayoutMutation, useGetTerminalLayoutsQuery } from "@api";
import { DataGrid, GridActionsCellItem, GridColumns } from "@mui/x-data-grid";
import { Paper, Typography, ListItem, ListItemText } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { ConfirmDialog, ConfirmDialogCloseHandler, ButtonLink } from "@components";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { TerminalLayout } from "@models";
import { Loading } from "@components/Loading";

export const TerminalLayoutList: React.FC = () => {
  const { t } = useTranslation(["terminals", "common"]);
  const navigate = useNavigate();

  const { data: layouts, isLoading: isTerminalsLoading } = useGetTerminalLayoutsQuery();
  const [deleteTerminal] = useDeleteTerminalLayoutMutation();

  const [layoutToDelete, setLayoutToDelete] = React.useState<number | null>(null);
  if (isTerminalsLoading) {
    return <Loading />;
  }

  const openConfirmDeleteDialog = (terminalId: number) => {
    setLayoutToDelete(terminalId);
  };

  const handleConfirmDeleteLayout: ConfirmDialogCloseHandler = (reason) => {
    if (reason === "confirm" && layoutToDelete !== null) {
      deleteTerminal(layoutToDelete)
        .unwrap()
        .catch(() => undefined);
    }
    setLayoutToDelete(null);
  };

  const columns: GridColumns<TerminalLayout> = [
    {
      field: "name",
      headerName: t("layoutName") as string,
      flex: 1,
      renderCell: (params) => <RouterLink to={`/terminal-layouts/${params.row.id}`}>{params.row.name}</RouterLink>,
    },
    {
      field: "description",
      headerName: t("layoutDescription") as string,
      flex: 2,
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("actions", { ns: "common" }) as string,
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          color="primary"
          label={t("edit", { ns: "common" })}
          onClick={() => navigate(`/terminal-layouts/${params.row.id}/edit`)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          color="error"
          label={t("delete", { ns: "common" })}
          onClick={() => openConfirmDeleteDialog(params.row.id)}
        />,
      ],
    },
  ];

  return (
    <>
      <Paper>
        <ListItem
          secondaryAction={
            <ButtonLink to="/terminal-layouts/new" endIcon={<AddIcon />} variant="contained" color="primary">
              {t("add", { ns: "common" })}
            </ButtonLink>
          }
        >
          <ListItemText primary={t("terminalLayouts", { ns: "common" })} />
        </ListItem>
        <Typography variant="body1">{}</Typography>
      </Paper>
      <DataGrid
        autoHeight
        rows={layouts ?? []}
        columns={columns}
        disableSelectionOnClick
        sx={{ mt: 2, p: 1, boxShadow: (theme) => theme.shadows[1] }}
      />
      <ConfirmDialog
        title={t("deleteLayout")}
        body={t("deleteLayoutDescription")}
        show={layoutToDelete !== null}
        onClose={handleConfirmDeleteLayout}
      />
    </>
  );
};