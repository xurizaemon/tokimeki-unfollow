let createListMenu = Vue.component('create-list-menu', {
  data: function() {
    return {
      title: '',
      private: true
    }
  },
  props: ['initialLists'],
  methods: {
    close() {
      this.$emit('close-add-to-list-menu', [this.order, this.saveProgressAsList, this.showBio]);
    }
  },
  template:`
    <div>
      <div v-if="!showCreateListMenu" class="button-menu">
        <button v-for="list in lists" class="button w100">
          {{ list.name }}
        </button>
        <button v-on:click="showCreateListMenu = true" class="button w100">Create New List...</button>
        <button v-on:click="showAddToListMenu = false" class="button w100">Cancel</button>
      </div>
      <div v-if="showCreateListMenu" class="button-menu">
        <div v-if="createListName.length > 25" class="input w100 logored">
          Max 25 characters -_-
        </div>
        <input type="text" placeholder="Enter list name..." v-model="createListName" class="input w100 bold">
        <div class="input w100">
          <input type="checkbox" id="private" name="private">
          <label for="private">Private</label>
        </div>
        <button v-on:click="showCreateListMenu = false; showAddtoListMenu = false; createList()" class="button w100">Create List</button>
        <button v-on:click="showCreateListMenu = false" class="button w100">Cancel</button>
      </div>
    </div>
  `
});