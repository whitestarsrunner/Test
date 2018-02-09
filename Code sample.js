//action creator

export let startGetOrders = () => {
  return (dispatch) => {
    api.getOrders()
      .then(
        (response) => {
          if(!response || !response.data) return;
          if (response) dispatch({ type: GET_ORDERS_SUCCESS, payload: response.data });
        },
        (/*err*/) => {
          stompClient.disconnect();
          setTimeout(() => connect(), 10000);
        }
      );
  };
};

// reducer
case GET_ORDERS_SUCCESS:
  newState = {};
  action.payload.map(item => {
    newState[item.orderId] = item;
  });
  return newState;

  // container

  import React, { Component } from 'react';
  import { connect } from 'react-redux';

  import Column from 'components/home/Column';
  import {
    Pending,
    Awaiting,
    InProcess,
    Ready,
    Delivery,
    Completed
  } from 'config/iconPath';


  import {
    search
  } from 'services/helpers';

  class Home extends Component {
    render() {
      let { orders, dispatch } = this.props;
      orders = Object.values(orders);
      const filter = this.props.filter;
      const noFilter = (filter.DELIVERY && filter.EXPRESS && filter.PICKUP) || (!filter.DELIVERY && !filter.EXPRESS && !filter.PICKUP);
      if (filter && !noFilter) {
        orders = orders.filter( item => {
          if (filter[item.type]) return true;
          return false;
        });
      }
      if (this.props.search) {
        orders = search(orders, this.props.search)
      }

      return (
        <div className="scroll-wrapper">
        <div className={`container ${addClass}`}>

            <Column
              orders={orders.filter((item) => item.status === 'VERIFICATION_PENDING' )}
              step="Verification Pending"
              iconPath={Pending}
              dispatch={dispatch}
              modal={this.props.mainModal}
            />
            <Column
              orders={orders.filter((item) => item.status === 'AWAITING_PROCESSING' )}
              step="Awaiting Processing"
              iconPath={Awaiting}
              dispatch={dispatch}
              modal={this.props.mainModal}
            />
            <Column
              orders={orders.filter((item) => item.status === 'IN_PROCESS' )}
              step="In Process"
              iconPath={InProcess}
              dispatch={dispatch}
              modal={this.props.mainModal}
            />
            <Column
              orders={orders.filter((item) => item.status === 'PACKED_READY' )}
              step="Packed & Ready"
              iconPath={Ready}
              dispatch={dispatch}
              modal={this.props.mainModal}
            />
            <Column
              orders={orders.filter((item) => item.status === 'OUT_FOR_DELIVERY' )}
              step="Out For Delivery"
              iconPath={Delivery}
              dispatch={dispatch}
              modal={this.props.mainModal}
            />
            <Column
              orders={orders.filter((item) => item.status === 'COMPLETED' )}
              step="Completed"
              iconPath={Completed}
              dispatch={dispatch}
              isOpened={darken}
              modal={this.props.mainModal}
            />
           </div>
        </div>
      );
    }
  }

  function mapStateToProps (state) {
    return {
      orders: state.orders,
      mainModal: state.mainModal,
      removeOrderModal: state.removeOrderModal,
      printOrderModal: state.printOrderModal,
      printReceiptModal: state.printReceiptModal,
      printLabelsModal: state.printLabelsModal,
      orderHistoryModal: state.orderHistoryModal,
      filter: state.filter,
      search: state.search
    };
  }

  export default connect(mapStateToProps)(Home);

  // element

  import React, { Component } from 'react';
  import ReactDOM from 'react-dom';

  import Order from './Order';

  import {
    openMainModal
  } from 'actions/mainModal';
  import SortModal from "./SortModal";

  import {
    ThreeDots
  } from 'config/iconPath';

  class Column extends Component {
    constructor(props) {
      super(props);
      this.state = {
        visible: false
      }
    }

    componentDidMount() {
      document.addEventListener('mousedown', this.handleClickOutside);
      document.addEventListener('touchstart', this.handleClickOutside);
    }

    componentWillUnmount() {
      document.removeEventListener('mousedown', this.handleClickOutside);
      document.removeEventListener('touchstart', this.handleClickOutside);
    }

    renderOrders() {
      if (!this.props.orders) return null;
      return this.props.orders.map((item, index) => {
        return (
          <Order
            order={item}
            key={index}
            showModal={() => this.props.dispatch(openMainModal(item))}
          />
        );
      });
    }

    openModal = () => {
      this.setState({
        visible: true
      });
    };

    closeModal = () => {
      this.setState({
        visible: false
      });
    };

    handleClickOutside = (event) => {
      const modal = ReactDOM.findDOMNode(this.modal);
      if (!modal) return;
      if (!modal.contains(event.target)) {
        this.closeModal();
      }
    };

    renderSort = () => {
      const sortAlign = this.props.step === 'Completed' ? 'left' : 'right';
      return (
        <SortModal
          visible={this.state.visible}
          orders={this.props.orders}
          dispatch={this.props.dispatch}
          ref={(c) => this.modal = c}
          closeModal={this.closeModal}
          sortAlign={sortAlign}
        />
      );
    };

    render() {
      const orders = this.props.orders || [];
      let addClass = this.props.step === 'Completed' ? 'custom-fill' : '';
      let darken = this.props.step === 'Completed' && this.props.isOpened === true ? 'darken' : '';
      return (
          <div className={`column ${darken}`}>
            <ThreeDots className="sort" onClick={this.openModal} />
            {this.renderSort()}
            <div className="number">
              {orders.length}
            </div>
            <div className="orders">ORDERS</div>
            <this.props.iconPath className={`icon ${addClass}`} style={{display: 'inline-block'}} width="40px;" height="40px"/>
            <div className="title">{this.props.step}</div>
            <div className="orders-container">
              {this.renderOrders()}
            </div>
          </div>
      );
    }
  }

  export default Column;
