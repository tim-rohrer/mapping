import { mount } from "enzyme"
import React from 'react'
import App from './App'
import { getMockProvider } from './__mocks__/getMockProvider'

jest.mock("react-redux", () => ({
  connect: () => jest.fn(),
  useSelector: jest.fn(fn => fn()),
  useDispatch: () => jest.fn()
}))

const setup = partialState => {
  const { MockProvider } = getMockProvider(partialState);

  // the other mocking you want to do like a custom hook

  return {
    MockProvider
    // you can return all mock instance from here, so you assert then in the tests
  }
}

test("it should work", () => {
  const { MockProvider } = setup();
  // you partial redux state here

  const wrapper = mount(
    <MockProvider>
      <App />
    </MockProvider>
  )

  // assert it
})

// import configureStore from 'redux-mock-store' //ES6 modules

// const middlewares = []
// const mockStore = configureStore(middlewares)

// // // You would import the action from your codebase in a real scenario
// // const addTodo = () => ({ type: 'ADD_TODO' })

// it('WTF am I doing?', () => {

//   // Initialize mockstore with empty state
//   const initialState = {}
//   const store = mockStore(initialState)

// //   // Dispatch the action
// //   store.dispatch(addTodo())

//   // Test if your store dispatched the expected actions
//   const actions = store.getActions()
//   const expectedPayload = { type: 'ADD_TODO' }
//   expect(actions).toEqual([expectedPayload])
// })