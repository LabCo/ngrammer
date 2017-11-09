import {test} from "../lib"
import {} from "jest"

describe("sample test", () => {

  it("should do something", () => {
    expect( test("foo") ).toEqual("foo")
  })

})