import com.facebook.react.bridge.Promise
import com.lucrasports.sdk.core.contest.PoolTournament

object ErrorMapper {
   fun rejectJoinTournamentError(promise: Promise, error: PoolTournament.JoinTournamentResult.Failure) {
       when(error.failure) {
           is PoolTournament.FailedTournamentCall.APIError -> promise.reject("APIError", error.toString())
           is PoolTournament.FailedTournamentCall.LocationError -> promise.reject("LocationError", error.toString())
           PoolTournament.FailedTournamentCall.UserStateError.InsufficientFunds -> promise.reject("insufficientFunds", "User has insufficient funds")
           PoolTournament.FailedTournamentCall.UserStateError.NotAllowed -> promise.reject("notAllowed", "User not allowed to perform operation")
           PoolTournament.FailedTournamentCall.UserStateError.NotInitialized -> promise.reject("notInitialized", "User has not been initialized")
           PoolTournament.FailedTournamentCall.UserStateError.Unverified -> promise.reject("unverified", "User is not verified")
       }
   }
    fun rejectRetrieveTournamentError(promise: Promise, error: PoolTournament.RetrieveTournamentResult.Failure) {
       when(error.failure) {
           is PoolTournament.FailedTournamentCall.APIError -> promise.reject("APIError", error.toString())
           is PoolTournament.FailedTournamentCall.LocationError -> promise.reject("LocationError", error.toString())
           PoolTournament.FailedTournamentCall.UserStateError.InsufficientFunds -> promise.reject("insufficientFunds", "User has insufficient funds")
           PoolTournament.FailedTournamentCall.UserStateError.NotAllowed -> promise.reject("notAllowed", "User not allowed to perform operation")
           PoolTournament.FailedTournamentCall.UserStateError.NotInitialized -> promise.reject("notInitialized", "User has not been initialized")
           PoolTournament.FailedTournamentCall.UserStateError.Unverified -> promise.reject("unverified", "User is not verified")
       }
   }

    fun rejectRecommendedTournamentsError(promise: Promise, error: PoolTournament.QueryRecommendedTournamentsResult.Failure) {
        when(error.failure) {
            is PoolTournament.FailedTournamentCall.APIError -> promise.reject("APIError", error.toString())
            is PoolTournament.FailedTournamentCall.LocationError -> promise.reject("LocationError", error.toString())
            PoolTournament.FailedTournamentCall.UserStateError.InsufficientFunds -> promise.reject("insufficientFunds", "User has insufficient funds")
            PoolTournament.FailedTournamentCall.UserStateError.NotAllowed -> promise.reject("notAllowed", "User not allowed to perform operation")
            PoolTournament.FailedTournamentCall.UserStateError.NotInitialized -> promise.reject("notInitialized", "User has not been initialized")
            PoolTournament.FailedTournamentCall.UserStateError.Unverified -> promise.reject("unverified", "User is not verified")
        }
    }
}
