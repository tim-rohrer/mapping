// import { setupGoogleMock } from '../__mocks__/GoogleMocks';
// import { fetchGoogleDetailsForPlaceId } from './googleUtilities';
import { testPlaces } from '../__mocks__/googlePlaceDetails';
 
describe('Google API Utilities', () => {
    // beforeAll(() => {
    //     setupGoogleMock();
    //   });

    it('provides place details for a Google PlaceId', async () => {
        const origin = "ChIJx52aAML8W4YR6jCnYGRNwAU";
        const destination = "ChIJGzE9DS1l44kRoOhiASS_fHg";

        // My test.js
        const fetchGoogleDetailsForPlaceId = jest.fn( (placeId) => {
            if (placeId in testPlaces) {
                return testPlaces[placeId].result;
            } else {
                return undefined
            }
            
        });
 
        await expect(fetchGoogleDetailsForPlaceId(destination)).toBeDefined;
        await expect(fetchGoogleDetailsForPlaceId(origin)).toBeUndefined;

    });

});
