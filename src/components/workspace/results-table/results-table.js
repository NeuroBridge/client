import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Card, Dialog, Divider, DialogContent, DialogTitle,
  Fade, Stack, Typography,
} from '@mui/material'
import { useWorkspace } from '../workspace'
import {
  DataGrid,
} from '@mui/x-data-grid'
import { Link } from '../../link'
import { columns } from './columns'
import { TableHeader } from './table-header'
import nihLogoIcon from '../../../images/pubmed-icon.png'

//

const LittleNihLogo  = () => <img src={ nihLogoIcon } height="12" />

//

export const SearchResultsTable = () => {
  const { results } = useWorkspace()
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const [activeRow, setActiveRow] = useState()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleChangeTab = (event, newIndex) => {
    setCurrentTabIndex(newIndex)
  }
  
  // tableData will be a memoized array consisting of just
  // the items from each interface in the results object.
  const tableData = useMemo(() => {
    if (!Object.keys(results).length) {
      return []
    }
    const interfaceId = Object.keys(results).sort()[currentTabIndex]
    return results[interfaceId]
  }, [currentTabIndex, results])

  const [pageSize, setPageSize] = useState(20)

  const handleRowClick = params => {
    setActiveRow(params.row)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    // we'll let the closing animation finish before unsetting the active row
    const unmountDelay = setTimeout(() => setActiveRow(null), 250)
    return () => clearTimeout(unmountDelay)
  }

  useEffect(() => {
    // but on a new active row, we'll just open the dialog right away.
    if (activeRow) {
      setDialogOpen(true)
    }
  }, [activeRow])

  //

  return (
    <Fade in={ !!Object.keys(results).length }>
      <Card>
        <DataGrid
          sx={{
            '.MuiDataGrid-row': { cursor: 'pointer' },
          }}
          autoHeight
          rows={ tableData }
          columns={ columns }
          getRowId={ row => row.pmid }
          pageSize={ pageSize }
          onPageSizeChange={ newSize => setPageSize(newSize) }
          rowsPerPageOptions={ [10, 20, 50] }
          components={{
            Toolbar: TableHeader,
          }}
          componentsProps={{
            toolbar: { currentTabIndex, handleChangeTab }
          }}
          disableSelectionOnClick
          checkboxSelection
          onRowClick={ handleRowClick }
        />
        {
          activeRow && <PublicationDialog
            publication={ activeRow }
            open={ dialogOpen }
            onClose={ handleCloseDialog }
          />
        }
      </Card>
    </Fade>
  )
}

const PublicationDialog = ({ onClose, open, publication }) => {
  return (
    <Dialog onClose={ onClose } open={ open }>
      <DialogTitle>{ publication.title }</DialogTitle>
      <Divider />
      <Stack
        direction="row"
        divider={ <Divider orientation="vertical" flexItem /> }
        sx={{ px: 3 }}
      >
        {
          publication.pmid && publication.pubmed_url && (
            <Stack direction="row" alignItems="center" gap={ 1 } sx={{ p: 1 }}>
              <LittleNihLogo />
              <Link to={ publication.pubmed_url }>
                Abstract
              </Link>
            </Stack>
          )
        }
        {
          publication.pmcid && publication.pmc_url && (
            <Stack direction="row" alignItems="center" gap={ 1 } sx={{ p: 1 }}>
              <LittleNihLogo />
              <Link to={ publication.pmc_url }>
                Full Text
              </Link>
            </Stack>
          )
        }
      </Stack>
      <Divider />
      <DialogContent sx={{ minHeight: '300px' }}>
        <Typography paragraph>
          <strong>Snippet:</strong> <em>{ publication.snippet }</em>
        </Typography>
      </DialogContent>
    </Dialog>
  )
}

PublicationDialog.propTypes = {
  publication: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}
