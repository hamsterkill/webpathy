api_id = '23274041'
api_hash = 'b8528722bcb86cbc9cbbfaa22deaeda3'

def process_user_status(status, types):
    if isinstance(status, types.UserStatusOnline):
        return 'online'
    elif isinstance(status, types.UserStatusRecently):
        return 'recently'
    elif isinstance(status, types.UserStatusLastWeek):
        return 'last week'
    elif isinstance(status, types.UserStatusLastMonth):
        return 'last month'
    elif isinstance(status, types.UserStatusOffline):
        return (f"{status.was_online.hour:02d}:{status.was_online.minute:02d} "
                f"{status.was_online.day:02d}.{status.was_online.month:02d}."
                f"{status.was_online.year} +00:00")
    else:
        return 'a long time ago'