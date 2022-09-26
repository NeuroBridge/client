import { Fragment, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Box, Fab, Paper, Card, CardActionArea, CardHeader, Tooltip, Zoom,
} from '@mui/material'
import { useBasket } from './context'
import { useDrawer } from '../drawer'
import { useOntology } from '../ontology'
import {
  Delete as RemoveIcon,
  Visibility as SelectedIcon,
  VisibilityOff as IgnoreIcon,
} from '@mui/icons-material'

//

export const BasketItem = ({ term }) => {
  const basket = useBasket()
  const drawer = useDrawer()

  return (
    <Fragment>
      <Card sx={{
        backgroundColor: '#234',
        color: '#def',
        fontSize: '75%',
        borderRadius: '3px',
        display: 'flex',
      }}>
        <CardActionArea onClick={ () => drawer.setTermId(term.id) }>
          <CardHeader title={ term.id } disableTypography />
        </CardActionArea>
        <Tooltip
          title={ `${ basket.contents[term.id] === 0 ? 'Show' : 'Hide' } term` }
          placement="top"
        >
          <CardActionArea onClick={ () => basket.toggle(term.id) } sx={{ padding: '0.5rem' }}>
            { basket.contents[term.id] === 0 &&
                <IgnoreIcon fontSize="small" sx={{ color: '#aaa' }} /> }
            { basket.contents[term.id] === 1 &&
                <SelectedIcon fontSize="small" sx={{ color: '#fff' }} /> }
          </CardActionArea>
        </Tooltip>
        <Tooltip title="Remove term from workspace" placement="top">
          <CardActionArea onClick={ () => basket.remove(term.id) } sx={{padding: '0.5rem' }}>
            <RemoveIcon fontSize="small" />
          </CardActionArea>
        </Tooltip>  
      </Card>
    </Fragment>
  )
}

BasketItem.propTypes = {
  term: PropTypes.object.isRequired,
}

//

export const Basket = () => {
  const ontology = useOntology()
  const basket = useBasket()
  const [terms, setTerms] = useState([])

  useEffect(() => {
    let newTerms = []
    basket.ids.forEach(id => {
      const index = ontology.terms.findIndex(term => term.id === id)
      if (index > -1) {
        newTerms.push(ontology.terms[index])
      }
    })
    setTerms(newTerms)
  }, [basket.ids])

  return (
    <Paper sx={{
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(#33669944 0px, transparent 2px)',
      backgroundColor: '#44668833',
      backgroundSize: '0.5rem 0.5rem',
      overflow: 'hidden',
      minHeight: '80px',
      borderRadius: 0,
      paddingTop: '1.5rem',
      position: 'relative',
    }}>
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        padding: '1rem',
      }}>
        {
          terms.map(term => <BasketItem key={ `workspace-item-${ term.id }` } term={ term } />)
        }
      </Box>
      <Zoom in={ !!basket.ids.length }>
        <Tooltip placement="top" title="Clear all terms from workspace">
          <Fab
            color="primary"
            size="small"
            sx={{ position: 'absolute', right: '1rem', bottom: '1rem', zIndex: 9, }}
            onClick={ basket.empty }
          ><RemoveIcon fontSize="small" /></Fab>
        </Tooltip>
      </Zoom>
    </Paper>
  )
}

