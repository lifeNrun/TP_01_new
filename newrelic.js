/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name : ['Mesh01'],
  /**
   * Your New Relic license key.
   */
  license_key : 'd8c6a9047c1ce0b64e9f04a914607ce8c574157f',
  logging : {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level : 'error'
  },
  error_collector: {
    ignore_status_codes: [401, 404]
  }
};
