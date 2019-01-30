let addToListMenu = Vue.component('add-to-list-menu', {
  data: function() {
    return {
      name: '',
      private: true,
      showCreateListMenu: false
    }
  },
  props: ['lists'],
  methods: {
    close() {
      this.$emit('close-menu', [this.order, this.saveProgressAsList, this.showBio]);
    },
    create() {
      if (this.nameValid) { 
        this.showCreateListMenu = false;
        this.$emit('create-list', [this.name, this.private]);
      }
    },
    focusInput() {
      this.$nextTick(() => this.$refs.input.focus())
    },
    addToList(listId) {
      this.$emit('add-to-list', listId);
      this.close();
    }
  },
  computed: {
    nameValid() {
      return this.name.length <= 25;
    }
  },
  template:`
    <div>
      <div v-if="!showCreateListMenu" class="button-menu">
        <button v-for="list in lists" v-on:click="addToList(list.id_str)" :key="list.id_str" class="button w100">
          {{ list.name }}
        </button>
        <button v-on:click="showCreateListMenu = true; focusInput()" class="button w100">Create New List...</button>
        <button v-on:click="close" class="button w100">Cancel</button>
      </div>
      <div v-if="showCreateListMenu" class="button-menu">
        <div v-if="!nameValid" class="input w100 logored">
          Max 25 characters -_-
        </div>
        <input type="text" placeholder="Enter list name..." ref="input" v-model="name" class="input w100 bold">
        <div class="input w100">
          <input type="checkbox" id="private" value="private" v-model="private">
          <label for="private">Private</label>
        </div>
        <button v-on:click="create" class="button w100" :class={gray:!nameValid,nodec:!nameValid}>Create List</button>
        <button v-on:click="showCreateListMenu = false" class="button w100">Cancel</button>
      </div>
    </div>
  `
});