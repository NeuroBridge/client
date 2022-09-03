import { interfaceDisplayNames } from '../interfaces'
import {
  renderAbstractHeader,
  renderAbstractCell,
  renderFullTextHeader,
  renderFullTextCell,
  renderScoreCell,
} from './renderers'

export const columns = [
  {
    field: 'title',
    headerName: 'Title',
    flex: 1,
  },
  {
    field: 'pmid',
    headerName: 'Abstract',
    sortable: false,
    filterable: false,
    renderHeader: renderAbstractHeader,
    renderCell: renderAbstractCell,
    width: 125,
  },
  {
    field: 'pmcid',
    headerName: 'Full Text',
    sortable: false,
    filterable: false,
    renderHeader: renderFullTextHeader,
    renderCell: renderFullTextCell,
    width: 125,
  },
  // { field: 'snippet', headerName: 'Snippet' },
  {
    field: 'score',
    headerName: 'Score',
    renderCell: renderScoreCell,
    width: 110,
  },
  {
    field: 'source',
    headerName: 'Source',
    valueGetter: ({ value }) => interfaceDisplayNames[value],
    width: 125,
  },
]

