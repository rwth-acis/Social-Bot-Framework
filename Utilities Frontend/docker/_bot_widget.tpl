<script src="<%= grunt.config('baseUrl') %>/js/bot_widget.js"></script>

<style>
        #modeluploader, #modelstorer, #modelloader {
          display: flex;
          margin: 5px;
          flex: 1;
          align-items: center;
        }
        #loadNameInput {
          width: 200px;
        }
</style>

<div>
<p><span style="font-weight: bold;">Model Operations</span></p>
<div id="modeluploader">
    <div>
      <i>Social bot manager endpoint: </i>
    </div>
    <div>
      <input id="sbfManagerEndpointInput" type="text" value=""></input>
      <button id="submit-model">Submit</button>
      <big id="sendStatus" class="form-text text-muted"></big>
    </div>
</div>
<div id="modelstorer">
    <div>
      <i>Store model as: </i>
    </div>
    <div>
      <input id="storeNameInput" value=""></input>
      <button id="store-model">Store</button>
      <big id="storeStatus" class="form-text text-muted"></big>
    </div>
</div>
<div id="modelloader">
    <div>
      <i>Load model: </i>
    </div>
    <div>
      <select id="loadNameInput"></select>
      <button id="load-model">Load</button>
      <big id="loadStatus" class="form-text text-muted"></big> 
    </div>
</div>
</div>