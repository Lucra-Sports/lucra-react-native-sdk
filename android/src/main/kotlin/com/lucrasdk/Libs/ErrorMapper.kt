import com.facebook.react.bridge.Promise
import com.lucrasports.sdk.core.contest.tournament.PoolTournament
import com.lucrasports.sdk.core.contest.tournament.PoolTournament.FailedTournamentCall

object ErrorMapper {
    fun rejectJoinTournamentError(
        promise: Promise,
        error: PoolTournament.JoinTournamentResult.Failure
    ) {
        when (error.failure) {
            is FailedTournamentCall.APIError ->
                promise.reject("APIError", error.toString())

            is FailedTournamentCall.LocationError ->
                promise.reject("LocationError", error.toString())

            FailedTournamentCall.UserStateError.InsufficientFunds ->
                promise.reject("insufficientFunds", "User has insufficient funds")

            FailedTournamentCall.UserStateError.NotAllowed ->
                promise.reject("notAllowed", "User not allowed to perform operation")

            FailedTournamentCall.UserStateError.NotInitialized ->
                promise.reject("notInitialized", "User has not been initialized")

            FailedTournamentCall.UserStateError.Unverified ->
                promise.reject("unverified", "User is not verified")

            FailedTournamentCall.UserStateError.DemographicInformationMissing -> {
                promise.reject("missingDemographicInformation", "User has missing demographic information")
            }
        }
    }

    fun rejectRetrieveTournamentError(
        promise: Promise,
        error: PoolTournament.RetrieveTournamentResult.Failure
    ) {
        when (error.failure) {
            is FailedTournamentCall.APIError ->
                promise.reject("APIError", error.toString())

            is FailedTournamentCall.LocationError ->
                promise.reject("LocationError", error.toString())

            FailedTournamentCall.UserStateError.InsufficientFunds ->
                promise.reject("insufficientFunds", "User has insufficient funds")

            FailedTournamentCall.UserStateError.NotAllowed ->
                promise.reject("notAllowed", "User not allowed to perform operation")

            FailedTournamentCall.UserStateError.NotInitialized ->
                promise.reject("notInitialized", "User has not been initialized")

            FailedTournamentCall.UserStateError.Unverified ->
                promise.reject("unverified", "User is not verified")

            FailedTournamentCall.UserStateError.DemographicInformationMissing -> {
                promise.reject("missingDemographicInformation", "User has missing demographic information")
            }
        }
    }

    fun rejectRecommendedTournamentsError(
        promise: Promise,
        error: PoolTournament.QueryRecommendedTournamentsResult.Failure
    ) {
        when (error.failure) {
            is FailedTournamentCall.APIError ->
                promise.reject("APIError", error.toString())

            is FailedTournamentCall.LocationError ->
                promise.reject("LocationError", error.toString())

            FailedTournamentCall.UserStateError.InsufficientFunds ->
                promise.reject("insufficientFunds", "User has insufficient funds")

            FailedTournamentCall.UserStateError.NotAllowed ->
                promise.reject("notAllowed", "User not allowed to perform operation")

            FailedTournamentCall.UserStateError.NotInitialized ->
                promise.reject("notInitialized", "User has not been initialized")

            FailedTournamentCall.UserStateError.Unverified ->
                promise.reject("unverified", "User is not verified")

            FailedTournamentCall.UserStateError.DemographicInformationMissing -> {
                promise.reject("missingDemographicInformation", "User has missing demographic information")
            }
        }
    }
}
