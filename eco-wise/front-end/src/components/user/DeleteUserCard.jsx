import { Box, Button, Card, CardContent } from '@mui/material'
import React, { useState } from 'react'
import CardTitle from '../common/CardTitle'
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteUserModal from './DeleteUserModal';

function DeleteUserCard(props) {
    const [openModal, setOpenModal] = useState(false)
    return (
        <>
            <Card>
                <CardContent>
                    <CardTitle icon={<DeleteIcon />} title='Delete User' />
                    <Box sx={{ marginTop: "1rem" }}>
                        Please understand that deleting your Account is a <b>Permanent</b> action and cannot be undone, all of your data will be lost. Please be sure before deleting your account.
                    </Box>
                    <Button variant='contained' onClick={() => setOpenModal(true)} sx={{ marginTop: "1rem", backgroundColor: "#f1e0e3", color: "rgb(220, 53, 69)" }}> I understand, Delete my account</Button>
                </CardContent>
            </Card>
            <DeleteUserModal
                deleteUser={props.deleteUser}
                openModal={openModal}
                setOpenModal={setOpenModal}
            />
        </>
    )
}

export default DeleteUserCard