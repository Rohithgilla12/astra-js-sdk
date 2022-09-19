import axios, { Axios } from 'axios';
import { Users } from "../resources/users";
import {AuthResource} from "../resources/auth/auth";

export enum BaseURL {
  Sandbox = "https://api-sandbox.astra.finance",
  Production = "https://api.astra.finance"
}
export interface AstraClientOptions {
  clientId: string,
  clientSecret: string,
  baseUrl: BaseURL
}

export class Astra {
  readonly _baseUrl: string;
  protected _clientId: string;
  protected _clientSecret: string;
  protected _client: Axios;
  users: Users;
  auth: AuthResource;

  constructor(options: AstraClientOptions) {
    if (!options) {
      throw Error("AstraClientOptions are required to configure the client. Please pass the options object to the constructor.")
    }

    const { clientId, clientSecret, baseUrl } = options;

    if (clientId == null) {
      throw Error("Client ID is required. You can find it at https://dashboard.astra.finance")
    }

    if (clientSecret == null) {
      throw Error("Client Secret is required. You can find it at https://dashboard.astra.finance")
    }

    if (baseUrl == null) {
      throw Error("Base URL is required. You can find the available options at https://docs.astra.finance/#introduction")
    }

    if (baseUrl as string != "https://api.astra.finance" && baseUrl as string != "https://api-sandbox.astra.finance") {
      throw Error("Invalid Base URL value. You can find the available options at https://docs.astra.finance/#introduction")
    }

    this._clientId = clientId;
    this._clientSecret = clientSecret;
    this._baseUrl = baseUrl

    this._initHttpClient();
    this._initResources();
    this._initExtendedResources();
  }

  protected _initHttpClient = () => {
    this._client = new axios.Axios({
      baseURL: this._baseUrl, auth: { username: this._clientId, password: this._clientSecret },
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      transformRequest: [function (data, headers) {
        if (headers != null && [headers['Content-Type'], headers['content-type']].indexOf('application/json') > -1) {
          return JSON.stringify(data)
        }
        return data
      }],
      transformResponse: [function (data, headers) {
        const acceptHeader: string | undefined = headers != null ? headers['Accept'] ?? headers['accept'] : undefined;
        if (acceptHeader == 'application/json' || acceptHeader == null || acceptHeader?.length === 0) {
          return JSON.parse(data);
        }
        return data;
      }]
    })
  }

  protected _initResources = () => {
    this.auth = new AuthResource(this._client, this._clientId, this._clientSecret)
    this.users = new Users(this._client);
  }

  /**
   * Intended for other projects to either override a specific resource or add in additional missing ones
   */
  protected _initExtendedResources = () => {

  }
}