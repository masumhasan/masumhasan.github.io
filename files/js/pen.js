const App = {
  data() {
    return {
      selectedContact: null,
      showContactForm: false,
      types: [
        { id: 1, description: "Personal", slug: "personal", color: "bg-amber-500" },
        { id: 2, description: "Work", slug: "work", color: "bg-yellow-500" },
        { id: 3, description: "Social", slug: "social", color: "bg-emerald-500" },
        { id: 4, description: "School", slug: "social", color: "bg-teal-500" },
      ],
      list: [
        {
          id: 1,
          name: "Jane Doe",
          email: "janedoe@gmail.com",
          phone: "999999999",
          type: {
            id: 1,
            description: "Personal",
            slug: "personal",
            color: "bg-amber-500",
          },
        },
        {
          id: 2,
          name: "Dr. Strange",
          email: "strange@gmail.com",
          phone: "123456789",
          type: { id: 2, description: "Work", slug: "work", color: "bg-yellow-500" },
        },
        {
          id: 3,
          name: "Cap America",
          email: "camerica@gmail.com",
          phone: "333333333",
          type: { id: 3, description: "Social", slug: "social", color: "bg-emerald-500" },
        },
        {
          id: 4,
          name: "Nick Fury",
          email: "fury@gmail.com",
          phone: "344444444",
          type: { id: 4, description: "School", slug: "social", color: "bg-teal-500" },
        },
        {
          id: 5,
          name: "Tony Stark",
          email: "tony@gmail.com",
          phone: "344444444",
          type: { id: 4, description: "School", slug: "social", color: "bg-teal-500" },
        },
      ],
    };
  },
  methods: {
    displayContactDetails(contact) {
      this.selectedContact = contact;
    },
    createNewContact() {
      this.clearSelectedContact();
      this.showContactForm = true;
    },
    saveContact() {
      if(!this.selectedContact.id){
          this.selectedContact.id = this.getLastInsertedId();
          this.list.push(this.selectedContact);
      }
    
      this.selectedContact = null;
      this.showContactForm = false;
    },
    getLastInsertedId(){
       let lastInsertedId = this.list.reduce(
        (max, item) => (item.id > max ? item.id : max),
        0
      );
      return lastInsertedId = lastInsertedId ? lastInsertedId + 1 : 1;
    },
    clearSelectedContact(){
     this.selectedContact = {
  name: '',
  email: '',
  phone: '',
  notes: '',
  type: null,
};
    }
  },
};

Vue.createApp(App).mount("#app");