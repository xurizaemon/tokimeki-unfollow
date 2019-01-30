let addToListMenu = Vue.component('add-to-list-menu', {
  data: function() {
    return {
      title: '',
      private: true
    }
  },
  props: ['initialLists'],
  methods: {
    close() {
      this.$emit('close-menu', [this.order, this.saveProgressAsList, this.showBio]);
    },
    create() {
      this.$emit('create-list', [this.title, this.private]);
    }
  },
  template:`
    <div>
      <div v-if="!showCreateListMenu" class="button-menu">
        <button v-for="list in lists" class="button w100">
          {{ list.name }}
        </button>
        <button v-on:click="showCreateListMenu = true" class="button w100">Create New List...</button>
        <button v-on:click="close" class="button w100">Cancel</button>
      </div>
      <div v-if="showCreateListMenu" class="button-menu">
        <div v-if="title.length > 25" class="input w100 logored">
          Max 25 characters -_-
        </div>
        <input type="text" placeholder="Enter list name..." v-model="title" class="input w100 bold">
        <div class="input w100">
          <input type="checkbox" id="private" value="private" v-model="private">
          <label for="private">Private</label>
        </div>
        <button v-on:click="showCreateListMenu = false; createList()" class="button w100">Create List</button>
        <button v-on:click="showCreateListMenu = false" class="button w100">Cancel</button>
      </div>
    </div>
  `
});