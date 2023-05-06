import * as React from "react";
import { Paper, Button, Typography, ListItem, ListItemText } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { selectUserRoleAll, useDeleteUserRoleMutation, useGetUserRolesQuery } from "@api";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@stustapay/models";
import { ConfirmDialog, ConfirmDialogCloseHandler } from "@components";
import { Loading } from "@stustapay/components";

export const UserRoleList: React.FC = () => {
  const { t } = useTranslation(["users", "common"]);
  const navigate = useNavigate();

  const { userRoles, isLoading } = useGetUserRolesQuery(undefined, {
    selectFromResult: ({ data, ...rest }) => ({
      ...rest,
      userRoles: data ? selectUserRoleAll(data) : undefined,
    }),
  });
  const [deleteUserRole] = useDeleteUserRoleMutation();
  const [userRoleToDelete, setUserRoleToDelete] = React.useState<number | null>(null);

  if (isLoading) {
    return <Loading />;
  }

  const addUserRole = () => {
    navigate("/user-roles/new");
  };

  const openConfirmDeleteDialog = (userId: number) => {
    setUserRoleToDelete(userId);
  };

  const handleConfirmDeleteUser: ConfirmDialogCloseHandler = (reason) => {
    if (reason === "confirm" && userRoleToDelete !== null) {
      deleteUserRole(userRoleToDelete)
        .unwrap()
        .catch(() => undefined);
    }
    setUserRoleToDelete(null);
  };

  const columns: GridColDef<UserRole>[] = [
    {
      field: "name",
      headerName: t("userRole.name") as string,
      flex: 1,
    },
    {
      field: "privileges",
      headerName: t("userPrivileges") as string,
      flex: 1,
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
          onClick={() => navigate(`/user-roles/${params.row.id}/edit`)}
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
            <Button onClick={addUserRole} endIcon={<AddIcon />} variant="contained" color="primary">
              {t("add", { ns: "common" })}
            </Button>
          }
        >
          <ListItemText primary={t("userRoles", { ns: "common" })} />
        </ListItem>
        <Typography variant="body1">{}</Typography>
      </Paper>
      <DataGrid
        autoHeight
        rows={userRoles ?? []}
        columns={columns}
        disableRowSelectionOnClick
        sx={{ mt: 2, p: 1, boxShadow: (theme) => theme.shadows[1] }}
      />
      <ConfirmDialog
        title={t("userRole.delete")}
        body={t("userRole.deleteDescription")}
        show={userRoleToDelete !== null}
        onClose={handleConfirmDeleteUser}
      />
    </>
  );
};