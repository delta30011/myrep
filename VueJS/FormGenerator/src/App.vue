<template>
    <div >
      <menu>
        <router-link
            to="/login"
            class="nav-link"
            active-class="active"
        >
          Вход
        </router-link>

          <router-link
              to="/registration"
              class="nav-link"
              active-class="active"
          >
            Регистрация
          </router-link>
      </menu>
      <router-view />
    </div>
</template>

<script setup lang="ts">

</script>

<style lang="scss" >
#app {
  border-radius:1em;
  box-shadow:0 5px 10px 2px rgba(34, 60, 80, 0.2) ;
  menu {
    display: flex;
    justify-content: space-between;
    padding: 0;

    a {font-size:1.2em;
      &.active {
        background: #646cff;
        color: #FFFFFF;
        border-radius: 5px;
        padding: 0 10px;
      }
    }
  }

  .form-control {
    border-radius: 5px;
    width: 100%;
    padding: 5px;
    box-sizing: border-box
  }

  [data-required] {
    label:after {
      content: ' *';
      color: #FF0000
    }
  }

  .row {
    padding-bottom: 0.5em
  }

  button {
    border: #EEEEEE 2px solid;
    margin-top:1em;
    &:hover {border-color:#DDDDDD}

    & + button {
      margin-left: 0.5em
    }
  }
}
</style>
