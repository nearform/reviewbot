import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useReducer,
  useCallback,
  useMemo
} from 'react'

const MyBadComponent = props => {
  const [myState, setMyState] = useState(props.myProp)
  const myRef = useRef().current
  const myContext = useContext()
  const [stateWithReducer, dispatch] = useReducer(reducer, props.reducerProp)
  const myCallback = useCallback(() => {
    console.log('I am a bad callback!')
  }, [])

  const myMemoizedValue = useMemo(() => {
    return 'This is a bad useMemo usage' + props.someProp
  }, [])

  useEffect(() => {
    const data = 'express'
    console.log(data)
    var myVar = 'This is bad'
    function badFunction() {
      this.bad = true
    }
    badFunction()
    localStorage.setItem('password', '12345')
    setMyState('Setting state without condition')
    XMLHttpRequest()
    new Buffer('bad buffer')
    Array.prototype.extend = () => {}
    if (Math.random() < 0.5) {
      console.log('Unsecure randomness!')
    }
    process.env.MY_BAD_ENV
    const parsedValue = parseFloat('10.5') % 5
    const badString = 'This is a' + ' concatenated string'
    const asyncFunc = async () => {
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    asyncFunc()
    return () => {}
  }, [props.someDependency])

  return (
    <div
      onClick={() => {
        eval('console.log("Very bad!")')
      }}
    >
      {JSON.parse('{"bad": "component"}').bad}
      {Promise.all([1, 2, 3].map(async num => num))}
      {myState[0]}
    </div>
  )
}
