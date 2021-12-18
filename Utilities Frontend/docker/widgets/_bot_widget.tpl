<script src="<%= grunt.config('baseUrl') %>/js/bot_widget.js"></script>
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
  rel="stylesheet"
  integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
  crossorigin="anonymous"
/>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css"
/>
<style>
  body {
    overflow-x: hidden;
  }
  #sbfManagerEndpointInput {
    min-width: 40vw;
  }
</style>

<div class="m-1">
  <h3>Model Operations</h3>
  <div class="d-flex flex-row justify-content-between">
    <div id="modeluploader">
      <label for="sbfManagerEndpointInput" class="form-label"
        >Social bot manager endpoint
      </label>
      <div class="input-group mb-3">
        <input
          id="sbfManagerEndpointInput"
          type="text"
          class="form-control"
          placeholder=""
          aria-label="Social bot manager endpoint"
          aria-describedby="submit-model"
        />
        <button id="submit-model" type="button" class="btn btn-outline-primary">
          <i class="bi bi-robot"></i> Submit
          <div
            class="spinner-border spinner-border-sm text-secondary"
            id="sendStatusSpinner"
            role="status"
            style="display: none"
          >
            <span class="visually-hidden">Loading...</span>
          </div>
        </button>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <div id="modelstorer">
          <label for="storeNameInput" class="form-label">Store model as </label>
          <div class="input-group mb-3">
            <input
              type="text"
              id="storeNameInput"
              class="form-control"
              aria-describedby="storeNameInput"
            />
            <!-- <div class="form-text text-sm text-muted">
            Store your model on the server to back it up.
          </div> -->

            <button id="store-model" class="btn btn-outline-primary">
              <i class="bi bi-cloud-arrow-up"></i> Store
              <div
                class="spinner-border spinner-border-sm text-secondary"
                id="storeStatusSpinner"
                style="display: none"
                role="status"
              >
                <span class="visually-hidden">Loading...</span>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div class="col">
        <div id="modelloader">
          <label for="loadNameInput" class="form-label">Load model</label>
          <div class="input-group">
            <select
              id="loadNameInput"
              class="form-select form-control"
            ></select>
            <!-- <div class="form-text text-sm text-muted">
            Load a backup model from the server.
          </div> -->

            <button id="load-model" class="btn btn-outline-primary">
              <i class="bi bi-cloud-arrow-down"></i> Load
              <div
                class="spinner-border spinner-border-sm text-secondary"
                id="loadStatusSpinner"
                role="status"
                style="display: none"
              >
                <span class="visually-hidden">Loading...</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>