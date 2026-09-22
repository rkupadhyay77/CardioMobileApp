import {StyleSheet, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  userIconContainer: {
    marginRight: 8,
  },
  userLabelText: {
    fontSize: 12,
    color: '#888888',
  },
  userNameText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: width * 0.05,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  tabButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tabButtonInactiveLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  tabButtonInactiveDark: {
    backgroundColor: 'rgba(38, 38, 42, 1.0)',
    borderColor: 'rgba(60, 60, 65, 1.0)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactiveLight: {
    color: '#555555',
  },
  tabTextInactiveDark: {
    color: '#AAAAAA',
  },
  tabBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabBadgeInactive: {
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  logCountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(164, 6, 12, 0.12)',
  },
  clearButtonText: {
    color: 'rgba(164, 6, 12, 1.0)',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 10,
    paddingHorizontal: width * 0.04,
  },

  // File Card Styles
  fileCard: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fileCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(230, 230, 230, 1.0)',
  },
  fileCardDark: {
    backgroundColor: 'rgba(38, 38, 42, 1.0)',
    borderColor: 'rgba(55, 55, 60, 1.0)',
  },
  fileCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  fileHeaderInfo: {
    flex: 1,
  },
  fileNameText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  fileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileMetaText: {
    fontSize: 11,
    color: '#888888',
    marginLeft: 4,
    marginRight: 10,
  },
  fileBadgeText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    marginVertical: 10,
  },
  cardDividerLight: {
    backgroundColor: 'rgba(240, 240, 240, 1.0)',
  },
  cardDividerDark: {
    backgroundColor: 'rgba(55, 55, 60, 1.0)',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  viewButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  viewButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emailButton: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
  },
  emailButtonText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Live Log Item Styles
  logItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  logItemLight: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(230, 230, 230, 1.0)',
  },
  logItemDark: {
    backgroundColor: 'rgba(38, 38, 42, 1.0)',
    borderColor: 'rgba(55, 55, 60, 1.0)',
  },
  logHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  indexBadge: {
    fontSize: 11,
    color: '#888888',
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
    marginTop: height * 0.15,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    color: '#888888',
  },

  // Preview Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: width * 0.92,
    maxHeight: height * 0.8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalContentLight: {
    backgroundColor: '#FFFFFF',
  },
  modalContentDark: {
    backgroundColor: '#26262A',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    maxWidth: width * 0.7,
  },
  modalBody: {
    padding: 16,
  },
  modalText: {
    fontFamily: 'Courier',
    fontSize: 12,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  modalFooterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  modalEmailButton: {
    backgroundColor: '#34C759',
  },
  modalEmailButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  modalCloseButton: {
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
  },
  modalCloseButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default styles;
