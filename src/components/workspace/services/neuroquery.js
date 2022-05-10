import { useMemo } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { Box, Button, Divider } from '@mui/material'
import { useBasket } from '../../basket'
import { useOntology } from '../../ontology'

const BASE_URL = `https://neurobridges.renci.org:13374/query`

export const NeuroQueryServiceInterface = ({ setLoading, setResults }) => {
  const basket = useBasket()
  const ontology = useOntology()
  
  const terms = useMemo(() => {
    return basket.contents.map(item => ontology.find(item))
  }, [basket.contents])

  const querystring = useMemo(() => {
    return terms.map(term => term.labels[0]).join('+')
  }, [terms])
  
  const url = useMemo(() => `${ BASE_URL }?${ querystring }`, [querystring])

  const handleClickQueryButton = () => {
    const fetchResults = async () => {
      setLoading(true)
      try {
        const response = await axios.get(BASE_URL, {
          params: { searchTerms: querystring}
        })
        if (!response?.data?.data) {
          throw new Error('An error occurred while querying NeuroQuery.')
        }
        setResults(response.data.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
      return
    }
    setResults([])
    fetchResults()
  }

  return (
    <Box>
      <pre>
        terms: { JSON.stringify(basket.contents) }
      </pre>
      <pre>
        url: { JSON.stringify(url) }
      </pre>
      <Divider />
      <Button variant="outlined" onClick={ handleClickQueryButton }>Query</Button>
    </Box>
  )
}

NeuroQueryServiceInterface.propTypes = {
  setLoading: PropTypes.func.isRequired,
  setResults: PropTypes.func.isRequired,
}
