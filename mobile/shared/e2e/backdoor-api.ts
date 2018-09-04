import * as fetch from 'node-fetch';
import { getRandomNumber } from './utils';

// Get the right environment
const envName = process.env.MB_ENV ? process.env.MB_ENV : 'default';
const ENV = require(`../../src/environments/environment.${envName}`).ENV;

// Get the backdoor API url baseedon the backend url specified in the environment
const backdoorURL = `${ENV.apiUrl}backdoor`;

// The hard-coded backdoor API key for staging environment.
const backdoorApiKey = 'z7NdGmXDcncz5Ht4D6P4m';

class BackdoorApi {
  /**
   * Get a random phone number that is currently not used by a client or stylist.
   */
  async getNewUnusedPhoneNumber(): Promise<string> {
    // TODO: call Backdoor API when it is ready. For now just generate random phone number.
    return `555${getRandomNumber(7)}`;
  }

  /**
   * Get login code for specified phone number
   */
  async getCode(phoneNumber: string): Promise<string> {
    try {
      const response = await fetch(`${backdoorURL}/get-auth-code?phone=${encodeURIComponent(phoneNumber)}`,
        { headers: { 'Authorization': `Secret ${backdoorApiKey}` } });

      if (response.status !== 200) {
        throw Error(`Backdoor API failed with HTTP Status: ${response.statusText}`);
      }

      const json = await response.json();
      return json.code;
    } catch (e) {
      throw Error(`Cannot get login code for phone ${phoneNumber}, ${e.toString()}`);
    }
  }
}

export const backdoorApi = new BackdoorApi();
