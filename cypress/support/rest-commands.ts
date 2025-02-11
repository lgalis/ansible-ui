/// <reference types="cypress" />
import '@cypress/code-coverage/support';

Cypress.Commands.add('requestPost', function requestPost<
  ResponseT,
  RequestT = ResponseT
>(url: string, body: Partial<RequestT>) {
  cy.getCookie('csrftoken').then((cookie) =>
    cy
      .request<ResponseT>({
        method: 'POST',
        url,
        body,
        headers: {
          'X-CSRFToken': cookie?.value,
          Referer: Cypress.config().baseUrl,
        },
      })
      .then((response) => response.body)
  );
});

Cypress.Commands.add('requestGet', function requestGet<T>(url: string) {
  return cy.request<T>({ method: 'GET', url }).then((response) => response.body);
});

Cypress.Commands.add('requestDelete', function deleteFn(url: string, ignoreError?: boolean) {
  cy.getCookie('csrftoken').then((cookie) =>
    cy.request({
      method: 'Delete',
      url,
      failOnStatusCode: ignoreError ? false : true,
      headers: { 'X-CSRFToken': cookie?.value, Referer: Cypress.config().baseUrl },
    })
  );
});
