const Promise = require('bluebird');
const { Pagination } = require('@limit0/mongoose-graphql-pagination');
const handlebars = require('../handlebars');
const Template = require('../models/template');
const fixtures = require('../fixtures');
const { buildEntityNameQuery, paginateSearch } = require('../elastic/utils');

module.exports = {
  /**
   *
   * @param {object} payload
   * @return {Promise}
   */
  create(payload = {}) {
    const template = new Template(payload);
    return template.save();
  },

  update(id, payload = {}) {
    if (!id) return Promise.reject(new Error('Unable to update template: no ID was provided.'));
    const criteria = { _id: id };
    const $set = {};
    ['name', 'html', 'fallback'].forEach((key) => {
      const value = payload[key];
      if (typeof value !== 'undefined') $set[key] = value;
    });
    const options = { new: true, runValidators: true };
    return Template.findOneAndUpdate(criteria, { $set }, options).then((document) => {
      if (!document) throw new Error(`Unable to update template: no record was found for ID '${id}'`);
      return document;
    });
  },

  /**
   * Find a Template record by ID.
   *
   * Will return a rejected promise if no ID was provided.
   * Will NOT reject the promise if the record cannnot be found.
   *
   * @param {string} id
   * @return {Promise}
   */
  findById(id) {
    if (!id) return Promise.reject(new Error('Unable to find template: no ID was provided.'));
    return Template.findOne({ _id: id });
  },

  /**
   * @param {object} criteria
   * @return {Promise}
   */
  find(criteria) {
    return Template.find(criteria);
  },

  /**
   * @param {string} id
   * @return {Promise}
   */
  removeById(id) {
    if (!id) return Promise.reject(new Error('Unable to remove template: no ID was provided.'));
    return this.remove({ _id: id });
  },

  /**
   * @param {object} criteria
   * @return {Promise}
   */
  remove(criteria) {
    return Template.remove(criteria);
  },

  /**
   * Paginates all Template models.
   *
   * @param {object} params
   * @param {object.object} params.pagination The pagination parameters.
   * @param {object.object} params.sort The sort parameters.
   * @return {Pagination}
   */
  paginate({ pagination, sort } = {}) {
    return new Pagination(Template, { pagination, sort });
  },

  /**
   * Searches & Paginates all Template models.
   *
   * @param {string} phrase The search phrase.
   * @param {object} params The search parameters.
   * @param {object.object} params.pagination The pagination parameters.
   * @return {ElasticPagination}
   */
  search(phrase, { pagination } = {}) {
    const query = buildEntityNameQuery(phrase);
    return paginateSearch(Template, phrase, query, { pagination });
  },

  /**
   *
   * @param {number} [count=1]
   * @return {object}
   */
  generate(count = 1) {
    return fixtures(Template, count);
  },

  async seed({ count = 1 } = {}) {
    const results = this.generate(count);
    await Promise.all(results.all().map(model => model.save()));
    return results;
  },

  render(source, data) {
    const template = handlebars.compile(source);
    return template(data);
  },

  /**
   * Returns a handlebars template to use when no fallback is provided.
   *
   * @param {boolean} withUa Whether or not to include the UA beacon.
   * @return string
   */
  getFallbackFallback(withUA = false) {
    const ua = withUA ? '{{build-ua-beacon}}' : '';
    return `<div style="width:1px;height:1px;" {{build-container-attributes}}>{{build-beacon}}${ua}</div>`;
  },
};
