import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  Box, Button, Card, CardContent, CardHeader, Collapse, Divider, IconButton,
  FormControlLabel, FormControl, FormLabel, FormGroup, LinearProgress,
  Stack, Switch, ToggleButton, ToggleButtonGroup,
} from '@mui/material'
import {
  Close as CloseIcon,
  Send as SearchIcon,
} from '@mui/icons-material'
import { useBasket } from '../../basket'
import { useOntology } from '../../ontology'
import { useSearch } from '../context'
import { Forest } from './selection-forest'
import { AddTermForm } from './add-term-form'
import { ConfigMenu } from './config-menu'

//

export const QueryBuilderContext = createContext({})
export const useQueryBuilder = () => useContext(QueryBuilderContext)

export const QueryBuilder = () => {
  const ontology = useOntology()
  const basket = useBasket()
  const [values, setValues] = useState({ })
  const [outerOperator, setOuterOperator] = useState('AND')
  const [innerOperator, setInnerOperator] = useState('OR')
  const [showRawQuery, setShowRawQuery] = useState(false)
  const { fetchResults, loading } = useSearch()


  // this is just a copy of the ids of the basket contents
  const roots = useMemo(() => [...basket.ids], [basket.ids])

  // this effect gets triggered when the basket contents update.
  // it handles updating the values this component holds in its state by
  // first starting with a base selection of "0" for all basket terms and their
  // descendants, and then spreading in the existing values already in state.
  useEffect(() => {
    const previousValues = { ...values }
    let baseValues
    roots.forEach(id => {
      const descendants = [
        id,
        ...ontology.descendantsOf(id).map(term => term.id),
      ]
      baseValues = {
        ...baseValues,
        ...descendants
          .reduce((obj, id) => ({
            [id]: basket.ids.includes(id) ? 1 : 0,
            ...obj,
          }), {}),
      }
    })
    setValues({ ...baseValues, ...previousValues })
  }, [basket.ids])

  const toggleTermSelection = id => event => {
    const newValue = (values[id] + 1) % 3
    const newValues = { ...values, [id]: newValue }
    // if the CTRL/CMD key is held down, then also toggle all
    // descendants to have the same state as the clicked term.
    if (event.nativeEvent.ctrlKey) {
      ontology.descendantsOf(id).forEach(term => {
        newValues[term.id] = newValue
      })
    }
    setValues(newValues)
  }

  const handleChangeOperator = whichOperator => {
    if (whichOperator === 'inner') {
      return event => setInnerOperator(event.target.value)
    }
    if (whichOperator === 'outer') {
      return event => setOuterOperator(event.target.value)
    }``
  }
  
  // here, we construct the query.
  const query = useMemo(() => {
    // build an easy way to lookup descendants.
    // `groups` has shape { [termId]: [descendants], [termId]: [descendants], ... }
    const groups = roots.reduce((obj, root) => {
      return {
        ...obj,
        [root]: [
          ...ontology
            .descendantsOf(root)
            .map(term => term.id)
        ]
      }
    }, {})
    let _query = { [outerOperator]: [] }
    roots.forEach(id => {
      if (groups[id].some(desc => values[desc] !== 0)) {
        _query[outerOperator].push({
          [innerOperator]: [
            ...groups[id]
              .filter(id => values[id] !== 0)
              .map(id => values[id] === 1 ? id : { NOT: [id] }),
          ]
        })
      }
    })
    if (roots.length === 1) {
      _query = _query[outerOperator][0]
    }
    return _query
  }, [roots, values, innerOperator, outerOperator])

  const toggleShowRawQuery = () => {
    setShowRawQuery(!showRawQuery)
  }

  return (
    <Card sx={{ position: 'relative' }}>
      <QueryBuilderContext.Provider value={{ values, toggleTermSelection, query }}>
        <CardHeader title="Query Builder" />

        <Divider />

        <ConfigMenu sx={{ position: 'absolute', right: 8, top: 8, zIndex: 9 }}>
          <Box sx={{ height: '30px' }} />

          <Divider />

          <FormGroup sx={{ p: 2 }}>
            <FormControlLabel
              label="Show raw query"
              labelPlacement="start"
              control={
                <Switch checked={ showRawQuery } onChange={ toggleShowRawQuery } />
              }
            />
          </FormGroup>

          <Divider />

          <Stack direction="column" gap={ 2 } sx={{ minWidth: '300px', p: 2, whiteSpace: 'nowrap' }}>
            <FormControl>
              <FormLabel>Between concept trees</FormLabel>
              <ToggleButtonGroup
                aria-label="Operator between concept trees"
                fullWidth
                size="small"
                color="primary"
                value={ outerOperator }
                exclusive
                onChange={ handleChangeOperator('outer') }
                >
                <ToggleButton value="AND">AND</ToggleButton>
                <ToggleButton value="OR">OR</ToggleButton>
              </ToggleButtonGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Within concept trees</FormLabel>
              <ToggleButtonGroup
                aria-label="Operator within concept trees"
                fullWidth
                size="small"
                color="primary"
                value={ innerOperator }
                exclusive
                onChange={ handleChangeOperator('inner') }
              >
                <ToggleButton value="AND">AND</ToggleButton>
                <ToggleButton value="OR">OR</ToggleButton>
              </ToggleButtonGroup>
            </FormControl>

          </Stack>
        </ConfigMenu>

        <Stack
          justifyContent="center"
          alignItems="stretch"
          sx={{ m: 3 }}
        >

          <Forest />

          <AddTermForm />
        </Stack>

        <Collapse
          in={ showRawQuery }
          sx={{
            position: 'relative',
            '.query': {
              m: 0, p: 1, pl: 3,
              backgroundColor: '#eee',
              color: '#556',
              fontSize: '85%',
            },
          }}>
            <IconButton
              onClick={ () => setShowRawQuery(false) }
              size="small"
              sx={{
                position: 'absolute',
                right: 5, top: 5,
                '&:hover': { '& svg': { filter: 'opacity(1.0)' } },
              }}
            ><CloseIcon fontSize="small" color="danger" sx={{ filter: 'opacity(0.33)' }} /></IconButton>
            <pre className="query">{ JSON.stringify(query, null, 2) }</pre>
        </Collapse>

        <Divider />
        
        <CardContent sx={{
          textAlign: 'right',
          '.button': {
            borderRadius: '23px',
          },
          '.label': {
            pt: '4px',
            margin: 'auto',
          },
         }}>
          <Button
            onClick={ () => fetchResults(query) }
            variant="contained"
            size="large"
            endIcon={ <SearchIcon /> }
            className="button"
            disabled={ basket.ids.length === 0 }
          ><span className="label">Search</span></Button>
        </CardContent>

      </QueryBuilderContext.Provider>

      <LinearProgress variant={ loading ? 'indeterminate' : 'determinate' } value={ 0 } />
    </Card>
  )
} 
