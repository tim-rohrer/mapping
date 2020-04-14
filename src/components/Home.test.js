jest.mock("react-redux", () => ({
  useSelector: jest.fn(fn => fn()),
  useDispatch: () => jest.fn()
}))

const setup = ({ totalCost }) => {
  jest.spyOn(Selectors, "totalCost").mockReturnValue(totalCost);
  jest.spyOn(Actions, "reset");
}

describe("useReset", () => {
  afterEach(() => {
    jest.clearAllMocks();
  })

  afterAll(() => {
    jest.restoreAllMocks();
  })

  test("Success", () => {
    
  })

  // test("Success Case", () => {
  //   setup({ totalCost: 1 });

  //   const resetFunc = useReset();
  //   resetFunc();

  //   expect(Actions.reset).toHaveBeenCalledTimes(1);
  // });

  // test("Failure Case", () => {
  //   setup({ totalCost: 0 });

  //   const resetFunc = useReset();
  //   resetFunc();

  //   expect(Actions.reset).toHaveBeenCalledTimes(0);
  // });
})